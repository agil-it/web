import { StringHelper } from "./String";

export class DateHelper {

  static formatDate(inputDate) {
    var date = this.getDate(inputDate);    

    var day = StringHelper.JustifyLeft(date.getDate(), 2, 0);
    var month = StringHelper.JustifyLeft(date.getMonth() + 1, 2, 0);
    var year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  static getDate(date){
    if (typeof date == "object") return date;
    
    return new Date(date);
  }
}