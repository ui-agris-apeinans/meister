import React, { Component } from 'react';
import Persons from './utils/Persons';
import Server from './Server';


let id = 0;

const switchId = (id) => -id - 1

export default class Client extends Component {
    constructor() {
        super();

        this.state = {
            persons: new Persons(),
        };
    }

    createPerson() {
        const person = {
            name: '',
            id: --id,
            saved: false
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

    onSaveSuccess = person => {
        const idOnClient = switchId(person.id);
        const personOnClient = this.state.persons.state.find(pers => pers.id === idOnClient);

        if (person.name !== personOnClient.name) {
            Server.patch({ ...person, name: personOnClient.name });
        }
        this.setState(state => ({
            persons: state.persons.update({ ...personOnClient, id: idOnClient, saved: true }),
        }));
    }

    updatePerson(person) {
        const idOnServer = switchId(person.id);

        if (person.saved) {
            Server.patch({ ...person, id: idOnServer }).then(this.onUpdateSuccess);
            this.setState(state => ({
                persons: state.persons.update({ ...person, saved: false }),
            }));
        }
    }

    onUpdateSuccess = person => {
        const idOnClient = switchId(person.id);
        const clientPerson = this.state.persons.state.find(pers => pers.id === idOnClient);

        this.setState(state => ({
            persons: state.persons.update({ ...clientPerson, saved: true }),
        }));
    }

    renderPersons() {
        return this.state.persons
            .get()
            .map(person => (
                <div key={person.id} className="challenge-person">
                    <span className="challenge-person-id" style={{
                        color: person.saved ? '#32c132' : 'orange'
                    }}>
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