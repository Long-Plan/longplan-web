import styled from "styled-components";
import useDialogueContext from "../../contexts/DialogueContext";
import { useEffect, useState } from "react";

function Dialogue() {
	const { dialogues, currentDialogue, setCurrentDialogue } =
		useDialogueContext();
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		const sortedComponents = dialogues.sort((a, b) => a.priority - b.priority);
		if (sortedComponents.length > 0 && sortedComponents[0].children) {
			setCurrentDialogue(sortedComponents[0].children);
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [dialogues, setCurrentDialogue]);
	return (
		<>
			{isVisible && (
				<Container>
					<Content>{currentDialogue}</Content>
				</Container>
			)}
		</>
	);
}

export default Dialogue;

const Container = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	width: 100vw;
`;

const Content = styled.div`
	background-color: white;
	border-radius: 20px;
	max-width: 850px;
	overflow-y: auto;
	max-height: 90vh;
`;
