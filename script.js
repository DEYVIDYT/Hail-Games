import * as THREE from 'three';
import { gsap } from 'gsap';

// Declare variables in a scope accessible by multiple functions
let scene, camera, renderer, planets = [];
let earthPlanet = null; // Variable to hold the Earth mesh

// Inicializa a cena de fundo 3D
const initBackground = () => {
    // Configuração da Cena
    scene = new THREE.Scene(); // Assign to declared variable
    //scene.background = new THREE.Color(0x07070e); // Fundo escuro sólido (opcional, o CSS já define o fundo do body)

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Assign to declared variable
    camera.position.z = 15; // Move a câmera para trás para ver mais da cena

    // Configuração do Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Assign to declared variable
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvasContainer = document.getElementById('canvas-container');
    if(canvasContainer) {
        canvasContainer.appendChild(renderer.domElement);
    }

    // Adiciona iluminação para que os materiais Standard/Phong funcionem
    const ambientLight = new THREE.AmbientLight(0x404040); // Luz ambiente suave
    scene.add(ambientLight);

    // Luz direcional simulando uma fonte de luz distante (como um sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5).normalize(); // Posição da luz
    scene.add(directionalLight);

    // Criação de partículas (sistema de estrelas ou poeira cósmica)
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 3000; // Aumentando um pouco as partículas

    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    // Preenche os arrays de posições e cores
    for (let i = 0; i < particleCount * 3; i++) {
        // Posições - maior dispersão para um efeito mais espacial
        if (i % 3 === 0) { // Coordenadas X
            posArray[i] = (Math.random() - 0.5) * 100;
        } else if (i % 3 === 1) { // Coordenadas Y
            posArray[i] = (Math.random() - 0.5) * 100;
        } else { // Coordenadas Z
            posArray[i] = (Math.random() - 0.5) * 100 - 50; // Dispersão em Z
        }

        // Cores (branco, com variação para um leve tom rosa/ciano)
        const baseColor = new THREE.Color(0.8, 0.8, 0.8); // Base branco
        const mixColor = new THREE.Color(Math.random() * 0.2 + 0.8, Math.random() * 0.2 + 0.8, Math.random() * 0.2 + 0.8); // Variação sutil
        baseColor.lerp(new THREE.Color(0xff0066), Math.random() * 0.1); // Mistura sutil com primary color
        baseColor.lerp(new THREE.Color(0x00ffcc), Math.random() * 0.1); // Mistura sutil com secondary color

        colorArray[i * 3] = baseColor.r;
        colorArray[i * 3 + 1] = baseColor.g;
        colorArray[i * 3 + 2] = baseColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Material para partículas
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1, // Tamanho das partículas
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending // Efeito de brilho
    });

    // Pontos
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Adiciona planetas do sistema solar (usando materiais que reagem à luz para um visual 3D)
    // Carregador de texturas
    const textureLoader = new THREE.TextureLoader();

    // Updated planet data with available textures
    const planetData = [
        // Using Mercury_baseColor.jpg texture
        { radius: 0.4, color: 0x8A8A8A, position: new THREE.Vector3(-6, 2, -25), name: 'Mercury', texture: '/Mercury_baseColor.jpg' },
        { radius: 0.7, color: 0xFFD700, position: new THREE.Vector3(8, -4, -35), name: 'Venus' }, // Venus-like (amarelado) - No texture provided
        // Using Earth_baseColor.jpg texture
        { radius: 0.8, color: 0x0077BE, position: new THREE.Vector3(-10, -1, -20), name: 'Earth', texture: '/Earth_baseColor.jpg' },
        // Using Mars_baseColor.jpg texture
        { radius: 0.5, color: 0xFF4500, position: new THREE.Vector3(9, 6, -30), name: 'Mars', texture: '/Mars_baseColor.jpg' },
        // Using Jupiter_baseColor.jpg texture
        { radius: 1.8, color: 0xD2691E, position: new THREE.Vector3(-18, 8, -45), name: 'Jupiter', texture: '/Jupiter_baseColor.jpg' },
        { radius: 1.6, color: 0xDAA520, position: new THREE.Vector3(20, -10, -55), name: 'Saturn' }, // Saturn-like (sem anel por simplicidade) - No texture provided
        { radius: 1.0, color: 0xAFEEEE, position: new THREE.Vector3(-25, 4, -65), name: 'Uranus' }, // Uranus-like (ciano claro) - No texture provided
        // Using Neptune_baseColor.jpg texture
        { radius: 1.0, color: 0x4682B4, position: new THREE.Vector3(30, -12, -75), name: 'Neptune', texture: '/Neptune_baseColor.jpg' }
    ];

    planets = []; // Clear and re-populate the global planets array
    planetData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32); // Geometria de esfera mais detalhada

        let material;
        if (data.texture) {
            // Carrega e aplica a textura
            const planetTexture = textureLoader.load(data.texture);
            material = new THREE.MeshStandardMaterial({
                 map: planetTexture, // Aplica a textura como mapa de cor
                 metalness: 0.1,
                 roughness: 0.8
            });
        } else {
            // Usa a cor sólida se não houver textura
            material = new THREE.MeshStandardMaterial({
                 color: data.color,
                 metalness: 0.1, // Ajuste para simular diferentes tipos de superfície
                 roughness: 0.8  // Ajuste para simular diferentes tipos de superfície
            });
        }

        const planet = new THREE.Mesh(geometry, material);
        planet.position.copy(data.position);
        planet.name = data.name; // Assign name to the mesh
        scene.add(planet);
        planets.push(planet); // Store in the global array

        if (data.name === 'Earth') {
            earthPlanet = planet; // Store Earth separately for easy access
        }
    });

    // Animação
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Rotacionar partículas lentamente
        if (particlesMesh) {
           particlesMesh.rotation.y = elapsedTime * 0.02;
        }


        // Rotacionar planetas lentamente em torno do próprio eixo e mover ligeiramente
        planets.forEach((planet, index) => {
            planet.rotation.y += 0.001; // Rotação lenta em torno do eixo Y

            // Animação de flutuação suave para dar mais vida
            // Find the original position data
            const originalPos = planetData.find(p => p.name === planet.name)?.position;
            if (originalPos) {
                const floatSpeed = 0.05;
                const floatAmount = 0.1;
                // Use the original position for the base of the floating animation
                planet.position.y = originalPos.y + Math.sin(elapsedTime * floatSpeed + index * 2) * floatAmount;
                planet.position.x = originalPos.x + Math.cos(elapsedTime * floatSpeed * 0.8 + index * 3) * floatAmount * 0.8;
            }
        });

        // Update camera's lookAt if it's being animated by GSAP onUpdate
        // No explicit lookAt update needed here if GSAP is handling it via onUpdate
        // renderer handles rendering

        if (renderer && scene && camera) {
           renderer.render(scene, camera);
        }
    };

    animate();

    // Lidar com redimensionamento da janela
    window.addEventListener('resize', () => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Recalcula pixel ratio
        }
    });
};

// Animação do logo e controle de sequência
const animateLogoAndTransition = () => {
    const introLogoDiv = document.getElementById('intro-logo');
    const donationPageDiv = document.getElementById('donation-page');
    // Seletores atualizados para serem mais específicos
    const logoSvg = document.querySelector("#intro-logo #logo");
    const logoText = document.querySelector("#intro-logo #logo text");
    const logoTspan = document.querySelector("#intro-logo #logo tspan");

    if (logoSvg && logoText && logoTspan && introLogoDiv && donationPageDiv) {
        // Define o estado inicial para a animação
        // Define logoSvg invisível inicialmente e centralizado
        gsap.set(introLogoDiv, { opacity: 1, display: 'flex' }); // Garante que está visível para a animação inicial
        gsap.set(logoSvg, { opacity: 0, scale: 0.8, transformOrigin: "center center" });
        gsap.set([logoText, logoTspan], { opacity: 0, y: 10 }); // Deslocamento vertical inicial leve para o texto

        // Cria uma timeline para a animação sequencial
        const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            onComplete: () => {
                // Animação finalizada, mostra a página de doação
                showDonationPage();
            }
        });

        // Anima o SVG completo (escala e opacidade)
        tl.to(logoSvg, {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)"
        });

        // Anima o texto principal (HAIL) e o tspan (GAMES) para a posição vertical correta e opacidade
        // Inicia esta animação após um pequeno atraso relativo ao início da animação do SVG
        tl.to([logoText, logoTspan], {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "<0.5"); // Inicia 0.5 segundos após o início da animação anterior

        // Opcional: Adiciona um efeito sutil de pulso/brilho final ao logo inteiro
        tl.to(logoSvg, {
            filter: 'drop-shadow(0 0 15px rgba(255, 0, 102, 0.7))', // brilho temporário mais intenso
            duration: 0.5,
            yoyo: true,
            repeat: 1
        }, ">-0.5"); // Sobrepõe ligeiramente com o final das animações de texto

        // Desaparece o container do logo de introdução
        tl.to(introLogoDiv, {
            opacity: 0,
            duration: 1,
            ease: "power2.in",
            onComplete: () => {
                // Esconde o container do logo de introdução completamente após desaparecer
                introLogoDiv.classList.add('hidden');
                introLogoDiv.style.display = 'none'; // Garante que o display seja none
            }
        }, "+=0.5"); // Espera um momento após a animação do logo antes de desaparecer

    } else {
        // Fallback: Se os elementos do logo não forem encontrados, apenas transiciona para a página de doação
        console.warn("Elementos do logo não encontrados ou problema na estrutura da página, pulando a animação detalhada do logo.");
        // Esconde o logo de introdução se ele existir
        if (introLogoDiv) {
            introLogoDiv.classList.add('hidden');
            introLogoDiv.style.display = 'none'; // Garante que o display seja none
        }
        setTimeout(showDonationPage, 500); // Espera um pouco antes de mostrar a página
    }
};

// Função para mostrar a página de doação
const showDonationPage = () => {
    const donationPageDiv = document.getElementById('donation-page');
    const introLogoDiv = document.getElementById('intro-logo');

    if (donationPageDiv) {
        // Garante que o logo de introdução esteja escondido
        if(introLogoDiv) {
            introLogoDiv.classList.add('hidden');
            introLogoDiv.style.display = 'none'; // Garante que o display seja none
        }

        // Torna a página de doação visível (remove display: none e define visibility: visible)
        donationPageDiv.classList.remove('hidden');
        donationPageDiv.classList.add('visible'); // Usa a classe visible para controlar visibility e opacidade


        // Anima a opacidade da página de doação de 0 para 1
        gsap.fromTo(donationPageDiv, { opacity: 0 }, {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });

        // Anima elementos dentro da página de doação, se necessário
        gsap.from(".donation-content h2, .donation-content p, .pix-key-container, .pulse-btn, .thank-you", {
            opacity: 0,
            y: 20,
            stagger: 0.15, // Atraso maior entre os elementos para uma animação mais suave
            duration: 0.8, // Duração maior para a animação dos elementos
            ease: "power2.out",
            delay: 0.6 // Atraso na animação ligeiramente após o container aparecer
        });

        // Animação de pulso para o botão Copiar
        const copyBtn = document.getElementById('copy-pix');
        if(copyBtn) {
            gsap.to(copyBtn, {
                boxShadow: '0 0 20px rgba(255, 0, 102, 0.7)', // Sutil brilho
                scale: 1.02, // Leve pulso de escala
                repeat: -1,
                yoyo: true,
                duration: 1.5,
                ease: "power1.inOut"
            });
        }

        // Permite rolagem agora
        document.body.style.overflow = 'auto';
    } else {
        console.error("Elemento da página de doação não encontrado!");
    }
};

// Função para esconder a página de doação
const hideDonationPage = () => {
    const donationPageDiv = document.getElementById('donation-page');
    if (donationPageDiv) {
        // Anima a opacidade para 0
        gsap.to(donationPageDiv, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.in",
            onComplete: () => {
                // Esconde o div completamente após desaparecer
                donationPageDiv.classList.add('hidden');
                donationPageDiv.classList.remove('visible'); // Remove a classe visible
                donationPageDiv.style.display = 'none'; // Garante que o display seja none

                // Restaura a rolagem (ou esconde se necessário)
                document.body.style.overflow = 'hidden'; // Ou defina como 'auto' dependendo da próxima tela
            }
        });
    }
};

// Função para animar o vôo para a Terra
const animateFlyToEarth = () => {
    if (!camera || !earthPlanet) {
        console.warn("Câmera ou planeta Terra não encontrados para a animação.");
        // Optionally hide the donation page anyway if animation isn't possible
        hideDonationPage();
        return;
    }

    const earthPosition = earthPlanet.position; // Get the Earth's current position

    // Define a target camera position - slightly behind and above Earth, looking at it
    // Adjust these values to frame the Earth nicely
    const targetPosition = new THREE.Vector3(
        earthPosition.x + 5, // Slightly to the right of Earth
        earthPosition.y + 2, // Slightly above Earth
        earthPosition.z + 10 // Slightly in front of Earth (closer to camera's original view)
    );

    // Save initial camera state if needed later (optional)
    // const initialCameraPosition = camera.position.clone();
    // const initialCameraRotation = camera.rotation.clone();

    // Hide the donation page UI elements smoothly before moving the camera
    const donationPageDiv = document.getElementById('donation-page');
    if (donationPageDiv) {
         gsap.to(donationPageDiv, { opacity: 0, duration: 0.8, ease: "power2.in" });
    }

    // Animate the camera position and orientation
    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 3, // Duration of the flight animation
        ease: "power2.inOut", // Easing for a smoother flight
        onUpdate: () => {
            // Make the camera constantly look at the Earth during the flight
            camera.lookAt(earthPosition);
        },
        onComplete: () => {
            console.log("Chegou perto da Terra!");
            // Animation complete, now hide the donation page div completely
            if (donationPageDiv) {
                donationPageDiv.classList.add('hidden');
                donationPageDiv.classList.remove('visible');
                donationPageDiv.style.display = 'none';
                document.body.style.overflow = 'hidden'; // Keep scrolling hidden
            }

            // Optional: Add a slight pause or another animation step here
            // For example, zoom slightly into Earth or transition to another view/state

            // You could potentially restore the camera to its original position
            // or move it to a new default position after a delay if needed.
        }
    });

    // Ensure the donation page container is hidden fully after the opacity animation
    // This is handled by the onComplete in the position animation,
    // but adding a separate onComplete to the opacity tween can be safer
    // if the position tween is skipped or interrupted.
    // Let's handle the full hide in the camera animation's onComplete for timing.
};

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    initBackground();
    animateLogoAndTransition();

    // Adiciona funcionalidade de copiar para a chave Pix
    const copyBtn = document.getElementById('copy-pix');
    const pixKeyElement = document.getElementById('pix-key');

    if (copyBtn && pixKeyElement) {
        copyBtn.addEventListener('click', async () => { // Usando async para usar await com clipboard API
            const pixKey = pixKeyElement.textContent.trim();

            // Reset animation temporarily
            gsap.killTweensOf(copyBtn); // Stop the pulse animation
            gsap.set(copyBtn, { boxShadow: '0 0 15px rgba(255, 0, 102, 0.5)', scale: 1 }); // Reset styles

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(pixKey);
                    // Feedback visual de sucesso
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copiado!';
                    gsap.to(copyBtn, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        // Reinicia a animação de pulso após o feedback
                        gsap.to(copyBtn, {
                            boxShadow: '0 0 20px rgba(255, 0, 102, 0.7)',
                            scale: 1.02,
                            repeat: -1,
                            yoyo: true,
                            duration: 1.5,
                            ease: "power1.inOut"
                        });
                    }, 2000); // Reverte texto e reinicia animação após 2 segundos
                } else {
                    // Fallback para navegadores mais antigos
                    const tempTextArea = document.createElement('textarea');
                    tempTextArea.value = pixKey;
                    tempTextArea.style.position = 'fixed'; // Torna-o invisível
                    tempTextArea.style.left = '-9999px';
                    tempTextArea.style.top = '-9999px';
                    document.body.appendChild(tempTextArea);
                    tempTextArea.focus();
                    tempTextArea.select();

                    document.execCommand('copy');

                    document.body.removeChild(tempTextArea); // Remove o textarea

                    // Feedback visual de sucesso para fallback
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copiado (Fallback)!';
                    gsap.to(copyBtn, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        gsap.to(copyBtn, { backgroundColor: '', duration: 0.2 }); // Reverte a color
                        // Reinicia a animação de pulso após o feedback
                        gsap.to(copyBtn, {
                            boxShadow: '0 0 20px rgba(255, 0, 102, 0.7)',
                            scale: 1.02,
                            repeat: -1,
                            yoyo: true,
                            duration: 1.5,
                            ease: "power1.inOut"
                        });
                    }, 2000);

                }
            } catch (err) {
                console.error('Falha ao copiar chave Pix: ', err);
                // Feedback visual de erro
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Erro!';
                gsap.to(copyBtn, { backgroundColor: 'red', duration: 0.2, yoyo: true, repeat: 1 });
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    gsap.to(copyBtn, { backgroundColor: '', duration: 0.2 }); // Reverte a color
                    // Reinicia a animação de pulso após o feedback de erro
                    gsap.to(copyBtn, {
                        boxShadow: '0 0 20px rgba(255, 0, 102, 0.7)',
                        scale: 1.02,
                        repeat: -1,
                        yoyo: true,
                        duration: 1.5,
                        ease: "power1.inOut"
                    });
                }, 2000);
            }
        });

    } else {
        console.warn("Botão Copiar ou elemento da chave Pix não encontrado.");
    }

    // Adiciona funcionalidade ao botão de fechar
    const closeBtn = document.getElementById('close-donation');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log("Close button clicked, starting fly animation.");
            animateFlyToEarth(); // Chama a função para animar o vôo para a Terra
        });
    } else {
        console.warn("Botão de fechar não encontrado.");
    }
});