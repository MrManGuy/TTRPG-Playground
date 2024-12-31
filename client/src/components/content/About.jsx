import { Container } from "react-bootstrap"

const About = () => {
    return <Container fluid className="page_body">
            <h2 className="section_header">About</h2>
            <p>
                My friends and I haven't found a service we like for running DND sessions virtually, so I decided to make my own. 
                I really wanted an intuitive, easy character maker, real time dice rolling for all parties, automatic logs of events, and private DM notes.
                These are all features of things like roll20, but the ability to fully customize these to my parties needs and having an open slot for a project made this perfect.
            </p>
            <h2 className="section_header">Credits</h2>
            <p>Art for default characters was created by <a href="https://www.youtube.com/@ShayMadeline2044">Shay Madeline</a></p>
            <p>Using <a href="https://github.com/3d-dice/dice-box-threejs">3D Dice</a>, I want to replace this with the main branch when 2.0 comes out</p>
        </Container>
}

export default About