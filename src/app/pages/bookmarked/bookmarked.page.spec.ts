import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookmarkedPage } from './bookmarked.page';

describe('BookmarkedPage', () => {
  let component: BookmarkedPage;
  let fixture: ComponentFixture<BookmarkedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
