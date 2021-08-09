import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';

const formatDate = (date) => format(addMinutes(date, date.getTimezoneOffset()), 'dd MMM yyyy');
const formatDateWithMinutes = (date) => format(addMinutes(date, date.getTimezoneOffset()), 'dd MMM yyyy HH:mm');

export { formatDate, formatDateWithMinutes };
