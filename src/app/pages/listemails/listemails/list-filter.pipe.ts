import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { Mail } from '../../apps/inbox/shared/mail.interface';

@Pipe({
  name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {

  transform(list: any[], filterText: string): any {
      console.log("filterText",filterText);
      
      console.log("QQQQtransform",list);
      console.log("keys",Object.keys(list));
      
    // list.forEach(element=>{
        // console.log("element",element);
        let returnList;
        returnList = list ? list.filter(item => item.content.search(new RegExp(filterText, 'i')) > -1) : [];
        console.log("returnList",returnList);
        return returnList;
        // return list ? list.filter(item => item.name.search(new RegExp(filterText, 'i')) > -1) : [];
    // })
   
  }

}