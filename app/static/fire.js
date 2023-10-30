function getRandomColor() {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    // Convert RGB to hexadecimal
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return hexColor;
}

const redPalette = ["#390099","#9e0059","#ff0054","#ff5400","#ffbd00"]

function createFirework() {
    const firework = document.createElement("div");
    firework.classList.add("firework");
    firework.style.left = `${Math.random() * 100}%`;
    firework.style.top = `${Math.random() * 100}%`;
    firework.style.animationDuration = `${Math.random() * 3 + 1}s`;

    //firework.style.backgroundColor = getRandomColor();
    color = redPalette[Math.floor(Math.random() * redPalette.length)];
    firework.style.backgroundColor = color;

    document.querySelector(".fireworks-container").appendChild(firework);

    firework.addEventListener("animationend", () => {
        firework.remove();
    });
}

setInterval(createFirework, 10); // Create fireworks at intervals
