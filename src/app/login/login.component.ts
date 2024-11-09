import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {AuthenticatedUser} from "../authentication/authenticated-user.class";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  jwtHelper: JwtHelperService;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private jwtService: JwtHelperService,
              private router: Router){

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.jwtHelper = jwtService;
  }

  ngOnInit() {
    this.loginForm.reset();
  }

 onLogin(){
    if(this.loginForm.invalid){
      return;
    }

    const { email, password } = this.loginForm.value;
    const body = {
      email: email,
      password: password
    }
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    this.http.post(`http://localhost:8080/auth/login`,body,{ headers: headers })
      .subscribe(
        response => {
          const decodedJWT = this.jwtHelper.decodeToken((response as any)['token']);
          console.log('Decoded JWT: ' + decodedJWT);
          this.completeSaveAndNavigate(decodedJWT)
            .then(() => console.log('Navigation complete'))
            .catch(error => console.error('Navigation error:', error));
        });
  }

  private async completeSaveAndNavigate(token: any) {
    try {
      const authUserObj = AuthenticatedUser.save("John Doe", 'user', token.access_token, token.refresh_token, 'form');
      console.log('Authenticated User:', authUserObj);

      const navigationSuccess = await this.router.navigate(['/home']);
      console.log('Navigation status:', navigationSuccess);
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  }

  loginWithGoogle() {
    console.log('Login with Google');

  }

  loginWithFacebook() {
    console.log('Login with Facebook');

  }

  loginWithOutlook() {
    console.log('Login with Outlook');

  }

}

