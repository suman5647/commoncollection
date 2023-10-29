import { Observable } from 'rxjs';

export interface DirtyCheckComponent {
    isDirty(): boolean | Observable<boolean>;
    resetForm(): void;
}