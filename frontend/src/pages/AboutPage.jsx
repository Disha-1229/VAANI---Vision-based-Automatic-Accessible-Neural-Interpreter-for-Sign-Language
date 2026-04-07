function AboutPage() {
  return (
    <section className="page">
      <h1 className="page-title">About VAANI</h1>

      <article className="card panel about-description">
        <p>
          VAANI (Vision-based Automatic Accessible Neural Interpreter) is an assistive
          communication system that bridges interaction between Indian Sign Language (ISL)
          users and non-signing individuals. It focuses on real-time recognition of ISL
          gestures through computer vision and deep learning, then converts the detected
          signs into readable text.
        </p>
        <p>
          The platform combines live webcam interpretation with a text-to-finger-spelling
          visualization module. This unified and web-based design makes the solution
          hardware-independent, scalable, and practical for everyday scenarios such as
          learning, communication support, and accessibility-focused applications.
        </p>
        <p>
          By reducing communication barriers and providing a simple user experience, VAANI
          demonstrates how AI-powered assistive technology can support more inclusive
          interactions for ISL communities.
        </p>
      </article>

      <article className="card panel">
        <h2>Team Members</h2>
        <ul className="team-list">
          <li className="team-item">
            <span className="team-avatar">D</span>
            <span>Disha Choudhury</span>
          </li>
          <li className="team-item">
            <span className="team-avatar">A</span>
            <span>Anam Saqib</span>
          </li>
          <li className="team-item">
            <span className="team-avatar">E</span>
            <span>Eshani Misra</span>
          </li>
          <li className="team-item">
            <span className="team-avatar">H</span>
            <span>Hrisita Mohapatra</span>
          </li>
        </ul>
      </article>
    </section>
  );
}

export default AboutPage;