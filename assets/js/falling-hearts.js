document.addEventListener('DOMContentLoaded', () => {
  const createHeart = () => {
    const heart = document.createElement('div');
    heart.classList.add('falling-heart');
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (8 + Math.random() * 7) + 's'; // 8–15 seconds
    heart.style.fontSize = (16 + Math.random() * 24) + 'px';
    document.body.appendChild(heart);
    setTimeout(() => {
      heart.remove();
    }, 16000);
  };

  setInterval(createHeart, 1500); // every 1.5 seconds
});