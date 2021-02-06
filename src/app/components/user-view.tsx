import * as React from 'react';

interface UserProps {
  pianoConnected: boolean;
}

export class User extends React.PureComponent<UserProps, unknown> {
  constructor(props: UserProps) {
    super(props);
  }

  public render(): JSX.Element {
    // const { pianoConnected } = this.props;

    return (
      <div className="pt-6 pr-8 pl-8">
        
      </div>
    )
  }
}