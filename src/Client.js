import React, { Component } from 'react';
import Persons from './utils/Persons';
import Server from './Server';

let id = 0;

export default class Client extends Component {
    constructor() {
        super();

        this.state = {
            persons: new Persons(),
            serverPersons: new Persons(),
        };
    }

    createPerson() {
        const person = {
            name: '',
            id: id++,
        };

        this.setState(state => ({
            persons: state.persons.add(person),
        }));

        this.savePerson(person);
    }

    onClickCreatePerson = () => {
        this.createPerson();
    }

    onClickSaveName(person) {
        this.updatePerson(person);
    }

    onChangeName(person, event) {
        const name = event.target.value;
        this.setState(state => ({
            persons: state.persons.update({
                ...person,
                name,
            }),
        }));
    }

    savePerson(person) {
        Server.post(person).then(this.onSaveSuccess);
    }

    updatePerson(person) {
        // if person not yet saved in server, we will update the name in onSaveSuccess
        const personInServer = this.state.serverPersons.state.find(currentPerson => currentPerson.id === person.id);
        if (personInServer) {
            Server.patch(person).then(this.onUpdateSuccess);
        }
    }

    onUpdateSuccess = person => {
        const personInState = this.state.persons.state.find(currentPerson => currentPerson.id === person.id)
        if (personInState.name === person.name) {
            this.setState(state => ({
                serverPersons: state.persons.update(person),
                persons: state.persons.update(person),
            }));
        }
    }

    onSaveSuccess = person => {
        const personInState = this.state.persons.state.find(currentPerson => currentPerson.id === person.id);
        const personOutdated = this.state.persons.state.find(currentPerson => currentPerson.name !== person.name);
        if (personOutdated) {
            Server.patch(personInState);
            this.setState(state => ({
                serverPersons: state.persons.update(personInState),
                persons: state.persons.update(personInState),
            }));
        } else {
            this.setState(state => ({
                serverPersons: state.persons.update(person),
                persons: state.persons.update(person),
            }));
        }
    }

    renderPersons() {
        return this.state.persons
            .get()
            .map(person => (
                <div key={person.id} className="challenge-person">
                    <span className="challenge-person-id">
                        {person.id}
                    </span>
                    <input
                        value={person.name}
                        className="challenge-person-name"
                        onChange={event => this.onChangeName(person, event)}
                    />
                    <button
                        className="challenge-person-save-name-button"
                        onClick={() => this.onClickSaveName(person)}
                    >
                        Save Name
                    </button>
                </div>
            ));
    }

    render() {
        return (
            <div className="challenge">
                <button
                    className="challenge-create-person-button"
                    onClick={this.onClickCreatePerson}
                >
                    Create Person
                </button>

                <div className="challenge-persons">
                    {this.renderPersons()}
                </div>
            </div>
        );
    }
}