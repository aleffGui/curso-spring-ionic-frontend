import { StorageService } from './../services/storage.service';
import { Observable } from 'rxjs/Rx';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(public storage: StorageService, public alertCrtl: AlertController){}


    intercept(req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
        console.log('passou')
        return next.handle(req)
        .catch((error, caught) => {

            let errorObj = error;
            if(errorObj.error) {
                errorObj = errorObj.error;
            }
            if(!errorObj.status) {
                errorObj = JSON.parse(errorObj);
            }
            console.log('Erro detectado pelo interceptor: ');
            console.log(errorObj)

            switch(errorObj.status) {

                case 401:
                    this.handle401()
                    break
                case 403:
                    this.handle403()
                    break
                default:
                    this.handleDefaultError(errorObj)
            }

            return Observable.throw(errorObj)
        }) as any
    }
    handle401() {
        let alert = this.alertCrtl.create({
            title: 'Erro 401: Falha de autenticação',
            message: 'Email ou senha incorretos',
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Ok'
                },
    
            ]
        })
        alert.present()
    }
    handle403() {
        this.storage.setLocalUser(null)
    }
    handleDefaultError(error) {
        let alert = this.alertCrtl.create({
            title: 'Erro ' + error.status + ': ' + error.error,
            message: error.message,
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Ok'
                },
    
            ]
        })
        alert.present()
    }
}
export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
}