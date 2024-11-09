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

 onSubmit(){
    if(this.loginForm.invalid){
      return;
    }

    const { email, password } = this.loginForm.value;
    const body = {
      username: email,
      password: password
    }
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    this.http.post(`http://localhost:8080/auth/basicauth`,body,{ headers: headers })
      .subscribe(
        response => {
          const decodedJWT = this.jwtHelper.decodeToken((response as any)['token']);
          console.log('Decoded JWT: ' + decodedJWT);
          this.completeSaveAndNavigate(decodedJWT);
        });
  }

  private async completeSaveAndNavigate(token: any){
    const authUserObj = AuthenticatedUser.save("John Doe", 'user', token.access_token, token.refresh_token, 'form' );
    console.log('Authenticated User:', authUserObj);

    await this.router.navigate(['/home']);

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

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Login successful', this.loginForm.value);

    }
  }
}

