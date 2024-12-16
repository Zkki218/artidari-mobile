import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials!: FormGroup;
  private loginSubscription?: Subscription;  // Using a subscription to manage the Observable


  constructor(
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) {}

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnDestroy(): void {     // Unsubscribe to prevent memory leaks
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();


    this.loginSubscription = this.authService.login(this.credentials.value).subscribe({ // Subscribe to the Observable
      next: user => {
        loading.dismiss();
        this.router.navigateByUrl('tabs/home', { replaceUrl: true });
      },
      error: err => {
        loading.dismiss();
        this.showAlert('Login failed', err.message);  // Use err.message here to handle specific errors
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


  goToRegister(){
    this.router.navigateByUrl('/register', { replaceUrl: true });
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