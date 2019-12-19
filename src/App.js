import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
  onCreateNote,
  onUpdateNote,
  onDeleteNote
} from "./graphql/subscriptions";

class App extends React.Component {
  state = {
    id: null,
    notes: [],
    title: "",
    description: ""
  };

  componentDidMount() {
    this.getNotes();
    if (this.state.notes) {
      this.createNoteListener = API.graphql(
        graphqlOperation(onCreateNote)
      ).subscribe({
        next: noteData => {
          const newNote = noteData.value.data.onCreateNote;
          const prevNotes = this.state.notes.filter(
            note => note.id !== newNote.id
          );
          this.setState({ notes: [...prevNotes, newNote] });
        }
      });

      this.updateNoteListener = API.graphql(
        graphqlOperation(onUpdateNote)
      ).subscribe({
        next: noteData => {
          const updatedNote = noteData.value.data.onUpdateNote;
          const { notes } = this.state;
          const idx = notes.findIndex(note => note.id === updatedNote.id);
          notes[idx] = updatedNote;
          this.setState({ notes });
        }
      });

      this.deleteNoteListener = API.graphql(
        graphqlOperation(onDeleteNote)
      ).subscribe({
        next: noteData => {
          const { notes } = this.state;
          const deletedId = noteData.value.data.onDeleteNote.id;
          const updatedNotes = notes.filter(note => note.id !== deletedId);
          this.setState({ notes: updatedNotes });
        }
      });
    }
  }

  componentWillUnmount() {
    this.createNoteListener.unsubscribe();
    this.updateNoteListener.unsubscribe();
    this.deleteNoteListener.unsubscribe();
  }

  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  };

  checkExistingNote = () => {
    const { id, notes } = this.state;
    if (id) {
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  };

  handleAddNote = async e => {
    const { title, description, id } = this.state;
    e.preventDefault();
    // let newNotes;
    if (this.checkExistingNote()) {
      // const result =
      await API.graphql(
        graphqlOperation(updateNote, {
          input: {
            id,
            title,
            description
          }
        })
      );
      // newNotes = notes;
      // const updatedNote = result.data.updateNote;
      // const index = notes.findIndex(note => note.id === updatedNote.id);
      // newNotes[index] = updatedNote;
      // this.setState({
      //   notes: newNotes
      // });
    } else {
      // const result =
      await API.graphql(
        graphqlOperation(createNote, {
          input: { title, description }
        })
      );
      // newNotes = [result.data.createNote, ...notes];
    }
    this.setState({ title: "", description: "", id: null });
  };

  handleDeleteNote = async id => {
    // const { notes } = this.state;
    // const result =
    await API.graphql(graphqlOperation(deleteNote, { input: { id } }));
    // const deletedId = result.data.deleteNote.id;
    // const updatedNotes = notes.filter(note => note.id !== deletedId);
    // this.setState({ notes: updatedNotes });
  };

  handleSetNote = ({ id, title, description }) =>
    this.setState({ id, title, description });

  render() {
    const { title, description, notes, id } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        <form className="mb3 flex flex-column" onSubmit={this.handleAddNote}>
          <input
            type="text"
            className="pa2 f4"
            placeholder="Enter a title"
            onChange={e => this.setState({ title: e.target.value })}
            value={title}
          />
          <textarea
            className="pa2 f4 mt2 mb3"
            placeholder="Enter a description"
            rows={5}
            onChange={e => this.setState({ description: e.target.value })}
            value={description}
          />
          <button className="pa2 f4 mb4" type="submit">
            {id ? "Update Note" : "Add Note"}
          </button>
          <div>
            {notes.map(note => (
              <div key={note.id} className="flex items-center">
                <li
                  className="list pa1 f3"
                  onClick={() => this.handleSetNote(note)}
                >
                  <strong>{note.title}</strong> - {note.description}
                </li>
                <button
                  className="bg-transparent bn f4"
                  onClick={() => this.handleDeleteNote(note.id)}
                >
                  <span>&times;</span>
                </button>
              </div>
            ))}
          </div>
        </form>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
