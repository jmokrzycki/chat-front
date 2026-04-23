export interface Message { // <-- DODAJ SŁOWO KLUCZOWE "export"
    text: string;
    sender: 'user' | 'assistant';
}