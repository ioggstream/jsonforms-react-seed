import * as React from 'react';
import ReactMarkdown from 'react-markdown'

// TODO: typings
export class Markdown extends React.Component<any, any> {

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div>
        <ReactMarkdown source={this.props.uischema.text} />
      </div>
    );
  }
}
