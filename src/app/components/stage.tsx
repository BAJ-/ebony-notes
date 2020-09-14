import * as React from 'react';
import { Routes } from './routes';

export class Stage extends React.PureComponent<unknown, unknown> {
  public render(): JSX.Element {
    return (
      <div className="pt-6 pr-8 pl-8 text-gray-800">
        <Routes />
      </div>
    )
  }
}