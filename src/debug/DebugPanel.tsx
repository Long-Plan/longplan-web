import clsx from "clsx";
import { pathToRegexp } from "path-to-regexp";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ClientRouteKey } from "../common/constants/keys";
import routes from "../core/routes";

type Props = {
  isDisplayed: boolean;
  routes: typeof routes;
};

function DebugPanel({ isDisplayed, routes }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  function goTo(link: ClientRouteKey) {
    return () => navigate(link.replace(":id", "1234"));
  }

  function isSelecting(link: ClientRouteKey) {
    return link.includes(":")
      ? pathToRegexp(link).regexp.test(location.pathname)
      : location.pathname === link;
  }

  if (isDisplayed) {
    return (
      <DebugPanelContainer>
        {routes.map(({ path }) => (
          <div
            key={path}
            className={clsx({ selected: isSelecting(path as ClientRouteKey) })}
            onClick={goTo(path as ClientRouteKey)}
          >
            {path}
          </div>
        ))}
      </DebugPanelContainer>
    );
  }

  return null;
}

const DebugPanelContainer = styled.div`
  position: absolute;
  bottom: 0;
  background-color: rgb(0 0 0 / 0.4);
  width: 216px;
  padding: 1em 0.5em;
  border-radius: 0 0.5em 0 0;
  color: white;
  font-weight: bold;
  z-index: 99;

  div {
    font-size: small;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    pointer-events: auto;
  }

  .selected {
    color: var(--primary-color);
  }
`;

export default DebugPanel;
