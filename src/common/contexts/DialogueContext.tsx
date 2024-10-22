import { create } from "zustand";

export type DialogueProps = {
	priority: number;
	children: React.ReactNode;
};

type DialogueStore = {
	dialogues: DialogueProps[];
	currentDialogue: React.ReactNode | null;
	setCurrentDialogue: (dialogue: React.ReactNode) => void;
	addDialogue: (dialogue: DialogueProps) => void;
	removeDialogue: () => void;
};

const useDialogueContext = create<DialogueStore>()((set) => ({
	dialogues: [],
	currentDialogue: null,
	setCurrentDialogue: (dialogue: React.ReactNode) =>
		set(() => ({ currentDialogue: dialogue })),
	addDialogue: (dialogue: DialogueProps) =>
		set((state) => ({ dialogues: [...state.dialogues, dialogue] })),
	removeDialogue: () =>
		set((state) => ({
			dialogues: state.dialogues.filter(
				(dialogueComponent) =>
					dialogueComponent.children !== state.currentDialogue
			),
		})),
}));

export default useDialogueContext;
