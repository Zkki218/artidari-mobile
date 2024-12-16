import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { StorageService } from '../services/storage.service';
import { INTRO_KEY } from '../guards/intro.guard';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage {
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  constructor(private router: Router, private storage: StorageService) { }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    console.log('ready: ', this.swiper);
  }
  
  next() {
    this.swiperRef?.nativeElement.swiper.slideNext();
    console.log('next');
  }

  prev() {
    this.swiperRef?.nativeElement.swiper.slidePrev();
    console.log('prev');
  }

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

  async startLogin() {
		await this.storage.set(INTRO_KEY, 'true');
    this.router.navigateByUrl('/login');
	}

  async startRegister() {
		await this.storage.set(INTRO_KEY, 'true');
    this.router.navigateByUrl('/register');
	}

}
