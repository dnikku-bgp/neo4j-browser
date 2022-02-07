/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { Component } from 'react'
import { withBus } from 'react-suber'
import { Bus } from 'suber'

import {
  ErrorText,
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledLink,
  StyledLinkContainer,
  StyledPreformattedArea
} from '../styled'
import { errorMessageFormater } from './../errorMessageFormater'
import Ellipsis from 'browser-components/Ellipsis'
import {
  ExclamationTriangleIcon,
  PlayIcon
} from 'browser-components/icons/Icons'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import {
  isImplicitTransactionError,
  isNoDbAccessError,
  isUnknownProcedureError
} from 'services/cypherErrorsHelper'
import { BrowserError } from 'services/exceptions'
import { deepEquals } from 'services/utils'
import {
  commandSources,
  executeCommand,
  listDbsCommand
} from 'shared/modules/commands/commandsDuck'
import { listAvailableProcedures } from 'shared/modules/cypher/procedureFactory'

type ErrorsViewComponentProps = {
  result: BrowserRequestResult
  bus: Bus
}
class ErrorsViewComponent extends Component<ErrorsViewComponentProps> {
  shouldComponentUpdate(props: ErrorsViewComponentProps): boolean {
    return !deepEquals(props.result, this.props.result)
  }

  render(): null | JSX.Element {
    const { bus } = this.props
    const error = this.props.result as BrowserError
    if (!error || !error.code) {
      return null
    }
    const fullError = errorMessageFormater(null, error.message)

    return (
      <StyledHelpFrame>
        <StyledHelpContent>
          <StyledHelpDescription>
            <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
            <StyledErrorH4>{error.code}</StyledErrorH4>
          </StyledHelpDescription>
          <StyledDiv>
            <StyledPreformattedArea>{fullError.message}</StyledPreformattedArea>
          </StyledDiv>
          {isUnknownProcedureError(error) && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onItemClick(bus, listAvailableProcedures)}
              >
                <PlayIcon />
                &nbsp;List available procedures
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isNoDbAccessError(error) && (
            <StyledLinkContainer>
              <StyledLink
                onClick={() => onItemClick(bus, `:${listDbsCommand}`)}
              >
                <PlayIcon />
                &nbsp;List available databases
              </StyledLink>
            </StyledLinkContainer>
          )}
          {isImplicitTransactionError(error) && (
            <StyledLinkContainer>
              <StyledLink onClick={() => onItemClick(bus, `:help auto`)}>
                <PlayIcon />
                &nbsp;Info on the <code>:auto</code> command
              </StyledLink>
              &nbsp;(auto-committing transactions)
            </StyledLinkContainer>
          )}
        </StyledHelpContent>
      </StyledHelpFrame>
    )
  }
}

const onItemClick = (bus: Bus, statement: string) => {
  const action = executeCommand(statement, { source: commandSources.button })
  bus.send(action.type, action)
}

export const ErrorsView = withBus(ErrorsViewComponent)

type ErrorsStatusBarProps = {
  result: BrowserRequestResult
}
export class ErrorsStatusbar extends Component<ErrorsStatusBarProps> {
  shouldComponentUpdate(props: ErrorsStatusBarProps): boolean {
    return !deepEquals(props.result, this.props.result)
  }

  render(): null | JSX.Element {
    const error = this.props.result as BrowserError
    if (!error || (!error.code && !error.message)) return null
    const fullError = errorMessageFormater(error.code, error.message)

    return (
      <Ellipsis>
        <ErrorText title={fullError.title}>
          <ExclamationTriangleIcon /> {fullError.message}
        </ErrorText>
      </Ellipsis>
    )
  }
}
