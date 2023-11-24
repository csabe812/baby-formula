import moment from 'moment';

export abstract class Util {
  public static dateParser(theDate: Date) {
    //return moment(theDate, 'YYYY-MM-DD').toString();
    return new Date().toISOString().replace(/T.*/, '');
  }
}
