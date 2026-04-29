import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'quiz-realm',
  clientId: 'quiz-frontend',
});

export default keycloak;
