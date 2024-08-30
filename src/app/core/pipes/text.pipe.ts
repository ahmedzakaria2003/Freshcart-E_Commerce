import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'text',
  standalone: true
})
export class TextPipe implements PipeTransform {

  transform(value:string | undefined,limit:number): string {
    if (!value) return ''; // Safeguard for undefined or null values
    return value.split(' ').slice(0, limit).join(' ');  }

}
