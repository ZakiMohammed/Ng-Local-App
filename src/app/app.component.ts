import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from './models/note';
import { StorageService } from './services/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  name: string = 'Zaki Mohammed';
  imagePath: string = '/assets/imgs/user.jpg';
  time: string = '';
  date: string = '';
  intervalTime: any;

  noteList: Note[] = [];
  tagList: string[] = ['Apple', 'Mango'];

  hidForm: boolean = false;

  frm: FormGroup;

  @ViewChild('txtTitle', { static: true }) txtTitle: ElementRef;
  @ViewChild('txtTag', { static: true }) txtTag: ElementRef;

  get f() {
    return this.frm.controls;
  }
  
  constructor(
    private storageService: StorageService,
    private builder: FormBuilder) {
    this.noteList = <Note[]>this.storageService.getObject('noteList');
  }

  ngOnInit(): void {
    this.time = this.getTime();
    this.date = this.getDate();
    this.intervalTime = setInterval(() => this.time = this.getTime(), 1000);  

    this.frm = this.builder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['']
    });
  }

  onAddClick($event: any) {
    this.hidForm = !this.hidForm;
    setTimeout(() => {
      this.txtTitle.nativeElement.focus();
    });
  }

  onTagAddClick($event: any) {
    let tag: string = this.txtTag.nativeElement.value;
    if (tag) {
      let found = this.tagList.find(i => i.toLocaleLowerCase() === tag.toLocaleLowerCase());
      if (!found) {
        this.tagList.push(tag);
      }
    }
  }

  onTagRemoveClick($event: any, index: number) {
    this.tagList.splice(index, 1);
  }

  onSubmit($event: any) {
    console.log(this.frm.value);
    
  }

  onResetClick($event: any) {

  }

  handleEnterKeyPress($event: any) {
    const tagName = $event.target.tagName.toLowerCase();
    if (tagName !== 'textarea') {
      return false;
    }
  }

  getTime() {
    return new Date().toLocaleTimeString().substr(0, 8);
  }

  getDate() {
    return new Date().toDateString();
  }

}
