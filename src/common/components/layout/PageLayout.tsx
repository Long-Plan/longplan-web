import clsx from "clsx";
import type React from "react";
import styled from "styled-components";

type Props = {
  isExpanded?: boolean;
  isCenter?: boolean;
  padding?: number;
  bgColor?: string;
  children?: React.ReactNode;
};

function PageLayout({
  children,
  padding = 0,
  isExpanded = false,
  isCenter = false,
  bgColor = "#f9f9f9",
}: Props) {
  return (
    <StyledLayout
      style={{
        padding: `${padding}rem`,
        background: `${bgColor}`,
      }}
      className={clsx("content-layout", {
        "-expanded": isExpanded,
        "-center": isCenter,
      })}
    >
      {children}
    </StyledLayout>
  );
}

const StyledLayout = styled.div`
  display: flex;
  position: relative;
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;
  background-color: #dddddd;

  &.content-layout {
    display: flex;
    flex-flow: column;
    gap: 1em;

    &.-expanded {
      flex-grow: 1;
    }

    &.-center {
      align-items: center;
      justify-content: center;
    }
  }
`;

export default PageLayout;
