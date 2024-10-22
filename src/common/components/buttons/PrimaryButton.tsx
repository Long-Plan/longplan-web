import styled from "styled-components";

export const PrimaryButton = styled.button`
	color: white;
	border-radius: 999px;
	padding: 0.5em 2em;
	font-size: 1.25em;
	width: fit-content;
	background-color: var(--blue-shadeb5);

	&:hover {
		background-color: var(--blue-shadeb6);
	}

	&:disabled {
		background-color: grey;
		cursor: not-allowed;
	}
`;
