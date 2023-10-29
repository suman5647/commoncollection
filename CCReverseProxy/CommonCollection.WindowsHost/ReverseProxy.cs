using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Formatters.Binary;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace CommonCollection.WindowsHost
{
    public static class ReverseHttpProxy
    {
        public static void Register(HttpConfiguration config)
        {
            // Attribute routing.
            // config.MapHttpAttributeRoutes();

            //// Convention-based routing.
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            config.Routes.MapHttpRoute(
                name: "any",
                routeTemplate: "api/{*path}",
                handler: HttpClientFactory.CreatePipeline(
                    innerHandler: new HttpClientHandler(),
                    handlers: new DelegatingHandler[]
                    {
                        new ReverseProxyHandler()
                    }
                ),
                defaults: new { path = RouteParameter.Optional },
                constraints: null
            );
        }
    }

    public class ReverseProxyHandler : DelegatingHandler
    {
        private static HttpClient client = new HttpClient(new HttpClientHandler
        {
            AllowAutoRedirect = false,
            MaxAutomaticRedirections = 20
        });

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var pathAndQuery = request.RequestUri.PathAndQuery;
            var forwardUri = new UriBuilder(request.RequestUri.AbsoluteUri);
            string proxyHost = ConfigurationManager.AppSettings["ProxyHost"];
            string proxyPort = ConfigurationManager.AppSettings["ProxyPort"];
            var ApiBaseUrl = "";
            //if app running on localhost redirect to test server
            //if (request.RequestUri.AbsoluteUri.Contains("localhost") && facetecPort != 8080)
            //{
            //    forwardUri.Host = proxyHost;
            //    forwardUri.Port = proxyPort;
            //    ApiBaseUrl = (facetecPort == 0) ? facetecHost : facetecHost + ":" + facetecPort;
            //}
            //else
            //{
            forwardUri.Host = "http://" + proxyHost;
            forwardUri.Port = int.Parse(proxyPort);
            ApiBaseUrl = "http://" + proxyHost + ":" + proxyPort;
            //}
            request.RequestUri = new Uri(ApiBaseUrl + "" + pathAndQuery);

            request.Headers.Host = null;
            if (request.Method == HttpMethod.Get)
            {
                request.Content = null;
            }
            //TODO
            try
            {
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                X509Certificate2 clientCert = request.GetClientCertificate();
                if (clientCert != null)
                {
                    request.Headers.Add("Client-Cert", Convert.ToBase64String(this.Serialize(clientCert)));
                }

                request.Headers.Add("CLIENT_IP_ADDRESS", HttpContext.Current.Request.UserHostAddress);

                request.Headers.Add("X-User-Agent", HttpContext.Current.Request.UserAgent ?? "Mozilla/4.0 (compatible; MSIE 6.0; " +
                                      "Windows NT 5.2; .NET CLR 1.0.3705;)");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                int statusCode = (int)response.StatusCode;
                //if (statusCode >= 300 && statusCode <= 399)
                //{
                //    Uri redirectUri = response.Headers.Location;

                //    if (!redirectUri.IsAbsoluteUri)
                //    {
                //        redirectUri = new Uri(request.RequestUri.GetLeftPart(UriPartial.Authority) + redirectUri);
                //    }

                //    return GetHtml(redirectUri);
                //}
                //else
                {
                    if (response.StatusCode != HttpStatusCode.OK
                                    && response.StatusCode != HttpStatusCode.NoContent
                                    && response.StatusCode != HttpStatusCode.NotModified
                                    && response.StatusCode != HttpStatusCode.Created
                                    && response.StatusCode != HttpStatusCode.NotFound)
                    {
                        // AuditLog.log($"Failed to proxy request: uri - {request.RequestUri}\n status code: {response.StatusCode}\n, User-Agent {HttpContext.Current.Request.UserAgent}", (int)Data.Enums.AuditLogStatus.FaceTec, (int)Data.Enums.AuditTrailLevel.Error);
                    }
                }

                // AuditLog.log($"proxy request for {request.RequestUri.ToString()} completed with: {response.StatusCode}", (int)Data.Enums.AuditLogStatus.FaceTec, (int)Data.Enums.AuditTrailLevel.Info);
                return response;
            }
            catch (Exception ex)
            {
                // AuditLog.log($"Failed to proxy request: Exception: {ex.ToString()}", (int)Data.Enums.AuditLogStatus.FaceTec, (int)Data.Enums.AuditTrailLevel.Error);
                return request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        private byte[] Serialize(object target)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                BinaryFormatter bf = new BinaryFormatter();
                bf.Serialize(ms, target);
                return ms.ToArray();
            }
        }
    }
}