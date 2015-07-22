/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var divStyle={ 
    width: '250px',
    height: '200px'  
};


var Comment = React.createClass({

  render: function() {
    // var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    var css = 'success';
    if(this.props.sentiment=='negative'){
      css = 'danger';      
    }
    if(this.props.sentiment=='neutral'){
      css = 'active';
    }
    return (
 
  // same final string, but much cleaner
  // return <div className={classes}>Great, I'll be there.</div>;
      <div className="row">                           
        <div className="comment">
          <h2 className="commentAuthor">
            {this.props.author}, {this.props.date}
          </h2>
        </div>
        <table className='table'>
          <tbody>
            <tr className={css}>
            <td>{this.props.text}</td>
            </tr>
          </tbody>
        </table>            
        <img className='col-md-2' style={divStyle} src={this.props.gifUrl}/>        
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comments.push(comment);
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });    
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        <CommentList data={this.state.data} />      
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <div>
          <Comment author={comment.author} key={index} date={comment.date} text={comment.text} gifUrl={comment.gifUrl} sentiment={comment.sentiment} sentimentScore = {comment.sentimentScore}>                     
          </Comment>          
        </div>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    var today = new Date();
    var dd = today.getDate(); 
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear(); 
    var todayDate = mm + '/' + dd +'/' + yyyy
    var gifUrl = '';
    var sentiment = '';
    var sentimentScore = 0;         
     $.ajax({
      async: false,
      url: '/translate',
      dataType: 'json',
      type: 'GET',
      data: {'text' : text},
      success: function(data) {                
        text=data.translatedText; 
        if(data.detectedSourceLanguage!='en'){
          window.alert('I think you wanted to say: ' + text);  
        }                 
        //this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); 
    $.ajax({
      async: false,
      url: '/giphy',
      dataType: 'json',
      type: 'GET',
      data: {'text' : text},
      success: function(data) {
        gifUrl=data.data[0].images.fixed_height.url;             
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });      
     $.ajax({
      async: false,
      url: '/sentimentAnalysis',
      dataType: 'json',
      type: 'GET',
      data: {'text' : text},
      success: function(data) {                    
        sentiment=data.aggregate.sentiment;          
        sentimentScore=data.aggregate.score*100;     
        sentimentScore=Math.round(sentimentScore * 100) / 100
        //this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    }); 

    this.props.onCommentSubmit({author: author, text: text, date: todayDate, gifUrl: gifUrl, sentiment: sentiment, sentimentScore: sentimentScore});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <div className='form-group'>
          <label for="nameInput">Name</label>
          <input type="text" className='form-control' placeholder="Your name" ref="author" />
          <label for="commentInput">Comment</label>
          <input type="text" className='form-control search-query' placeholder="Say something..." ref="text" />
          <p/><p/><p/><p/>
          <p><input className='btn btn-primary' type="submit" value="Post" /></p>
        </div>
      </form>
    );
  }
});

React.render(
  // <CommentBox url="comments.json" pollInterval={2000} />,
  <CommentBox url="comments.json"/>,
  document.getElementById('content')
);
