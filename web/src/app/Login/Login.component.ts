import {Component, OnInit} from '@angular/core';
import {Animations} from '../app.animations';
import {FormGroup, FormBuilder, FormControl, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {RegisterModel} from '../models/register.model';
import {LoginModel} from '../models/login.model';
import {Router} from '@angular/router';
import {UserData} from '../models/UserData.model';
import {Data} from '../data.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './Login.component.html',
  styleUrls: [
    './Login.component.css',
    '../common.css'
  ],
  animations: [
    Animations.toggleSlide,
    Animations.shake
  ]
})

export class LoginComponent implements  OnInit {
  public title = 'Grouse';
  public login: boolean;

  regUser: RegisterModel = new RegisterModel();
  loginUser: LoginModel = new LoginModel();
  registerForm: FormGroup;
  loginForm: FormGroup;
  shake: boolean;

  private http: HttpClient;
  private router: Router;
  private userData: UserData;
  private data: Data;
  private snackBar: MatSnackBar;

  email = new FormControl('',
    [Validators.required, Validators.email]);

  getErrorMessage() {
    return this.email.hasError('required') ? 'Du må skrive inn en E-post adresse' :
      this.email.hasError('email') ? 'Ikke en gyldig E-post Adresse' : '';
  }

  constructor(http: HttpClient, private formBuilder: FormBuilder, router: Router, data: Data, snackBar: MatSnackBar) {
    this.login = true;
    this.http = http;
    this.router = router;
    this.data = data;
    this.userData = new UserData();
    this.shake = false;
    this.snackBar = snackBar;
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: [this.regUser.email, [
        Validators.required,
        Validators.email
      ]],
      name: [this.regUser.name, []],
      password: [this.regUser.password, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]],
      passwordRepeat: [this.regUser.passwordRepeat, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]]
    });

    this.loginForm = this.formBuilder.group({
      email: [this.loginUser.email, [
        Validators.required,
        Validators.email
      ]],
      password: [this.loginUser.password, [
        Validators.required
      ]]
    });

    this.data.currentMessage.subscribe(msg => this.userData = msg);
  }

  // Creates a new user
  registerSubmit() {
    console.log('New user request called with e-mail: ' + this.regUser.email);
    this.shake = false;
    // Sets the username to the users e-mail if the user did not enter a displayname
    if (this.regUser.name === null || this.regUser.name === '') {
      this.regUser.name = this.regUser.email;
    }
    if (this.regUser.password === this.regUser.passwordRepeat) { // Checks that passwords match

      // If everything is in order, sends the data to server
      const body: INewUser = {
        username: this.regUser.email,
        password: this.regUser.password
      };
      this.http.post(this.userData.userAdress, body).subscribe(
        result => {
          // The transmission was a succsess and the server accepted the new user
          console.log('Account creation was a success! Signing in with the new user');
          this.loginUser.password = this.regUser.password;
          this.loginUser.email = this.regUser.email;
          this.loginSubmit();
        }, error => {
          // There was an error

          // A user with the email entered allready exists
          if (error.error.message.startsWith('No GrouseUser exists')) {
            this.shake = true;
            this.snackBar.open('En bruker med denne e-posten eksisterer allerede', 'Lukk');
          }
        });
    }
  }

  loginSubmit() {
    console.log('Loggin request called with username: ' + this.loginUser.email + ', on adress: ' + this.userData.loginAdress);
    this.shake = false; // Resets the shake animation
    // Sends login info to the server

    // Constructs the parameters that will be sendt to the server
    let body = new HttpParams();
    body = body.set('grant_type', 'password');
    body = body.append('username', this.loginUser.email.toString());
    body = body.append('password', this.loginUser.password.toString());
    body = body.append('client_id', this.userData.oauthClientId);

    this.http.post(this.userData.loginAdress, body, {
      // Constructs the headers
      headers: new HttpHeaders({
        Authorization: 'Basic ' + btoa(this.userData.oauthClientId + ':' + this.userData.oauthClientSecret),
        'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
      })
    }).subscribe(
      result => {
        // @ts-ignore
        this.userData.oauthClientSecret = result.access_token;
        this.router.navigate(['/Menu']);
      }, error => {
        if (error.error.error_description === 'Bad credentials') {
          this.shake = true; // Shakes the main card to illustrate that there was en error
          this.snackBar.open('Feil med passord eller e-post', 'Lukk');
        } else {
          alert('En uventet feil har oppstått, prøv igjen. Eller se konsol, for flere detaljer');
          console.log(error);
        }
      }
    );
  }

  public changeMode() {
    this.login = !this.login;
  }
}

interface INewUser {
  username: string;
  password: string;
}
