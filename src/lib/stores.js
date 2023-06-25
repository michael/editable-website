import { writable } from 'svelte/store';

export const activeEditorView = writable(null);
export const isEditing = writable(false);
export const currentUser = writable(null);
