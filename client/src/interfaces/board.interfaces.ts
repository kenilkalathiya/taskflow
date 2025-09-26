// src/interfaces/board.interfaces.ts

export interface Card {
  _id: string;
  title: string;
  list: string; // The ID of the list this card belongs to
  board: string; // The ID of the board this card belongs to
  // Add other card properties like description, position, etc. as needed
}

export interface List {
  _id: string;
  name: string;
  cards: Card[];
  board: string; // The ID of the board this list belongs to
  cardOrder: string[];
}

export interface BoardData {
  _id: string;
  name: string;
  lists: List[];
  owner: string; // The ID of the board owner
  members: string[]; // Array of user IDs who are members
}