import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  credentials!: FormGroup;
  private registerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) {}

  // Easy access for form fields
  get username() {
    return this.credentials.get('username');
  }

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  get description() {
    return this.credentials.get('description');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      username: ['', [Validators.required]], // Added username validator
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      description: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  ngOnDestroy(): void {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
  }


  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.registerSubscription = this.authService.createUser(this.credentials.value).subscribe({
      next: userCredential => {  // User credential is now passed
        loading.dismiss();
        this.showAlert('Registration Successful', 'Please login from the login page.');
        this.goToLogin();
      },
      error: err => {
        loading.dismiss();
        this.showAlert('Registration failed', err.message);
      }
    });
  }

  async googleLogin() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const user = await this.authService.loginWithGoogle(); // Use async/await
      loading.dismiss();
      this.router.navigateByUrl('tabs/home', { replaceUrl: true });
    } catch (err: any) { // Catch any errors here
      loading.dismiss();
      this.showAlert('Google Login failed', err.message);
    }
  }

  //Method to navigate to Login page
  goToLogin(){
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }



  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}