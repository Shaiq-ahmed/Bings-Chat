import { format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';

export function formatMessageTime(dateString) {
  const date = parseISO(dateString);
  return format(date, 'HH:mm');
}

export function formatMessageDate(dateString) {
  const date = parseISO(dateString);
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM d, yyyy');
  }
}

export function formatChatLastDate(dateString) {
  const date = parseISO(dateString);
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'P');
  }
}

export function shouldShowDateSeparator(currentMessage, previousMessage) {
  if (!previousMessage) return true;
  const currentDate = parseISO(currentMessage.createdAt);
  const previousDate = parseISO(previousMessage.createdAt);
  return !isSameDay(currentDate, previousDate);
}

