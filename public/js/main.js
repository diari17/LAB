document.addEventListener('DOMContentLoaded', () => {
// Mettre en évidence le lien de navigation actif
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach(link => {
if (link.getAttribute('href') === currentPath) {
link.style.fontWeight = 'bold';
link.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
}
});
// Animation simple pour les messages de succès
const thanksMessage = document.querySelector('.thanks-message');
if (thanksMessage) {
thanksMessage.style.animation = 'fadeIn 1s ease-in';
}
});
// Fonction de validation du formulaire de contact
const contactForm = document.querySelector('form[action="/contact"]');
if (contactForm) {
contactForm.addEventListener('submit', (e) => {
const emailInput = contactForm.querySelector('#email');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailPattern.test(emailInput.value)) {
e.preventDefault();
alert('Veuillez entrer une adresse email valide.');
}
});
}

// Filtrage des cours
const filterForm = document.getElementById('filter-form');
if (filterForm) {
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const level = document.getElementById('level').value;
    const price = document.getElementById('price').value;
    
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
      const cardLevel = card.querySelector('.level').textContent;
      const cardPrice = parseInt(card.querySelector('.price').textContent);
      
      const levelMatch = !level || cardLevel === level;
      const priceMatch = !price || cardPrice <= parseInt(price);
      
      if (levelMatch && priceMatch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}