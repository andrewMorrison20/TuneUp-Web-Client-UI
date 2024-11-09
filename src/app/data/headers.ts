import { HttpHeaders } from '@angular/common/http';

export const buildDefaultPostHeaders: () => HttpHeaders = () => {
    return new HttpHeaders().append('Accept', 'application/json').append('Content-type','application/json');

}