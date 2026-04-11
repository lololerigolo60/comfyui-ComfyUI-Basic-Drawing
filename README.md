Ce node est un "Canvas Interactif" qui fait le pont entre une  action manuelle (dessiner) et la puissance de calcul de Flux2 Klein edit . Contrairement aux nodes standards, il possède une interface graphique (le panneau de dessin) directement intégrée dans l'espace de travail ComfyUI.
2. Les entrées et sorties du Node

    image (Entrée optionnelle) : Sert de fond de référence. C'est ici que tu connectes ton Load Image.

    auto_mask (Entrée optionnelle) : Reçoit les masques générés par l'IA (comme SAM). Il accepte désormais des "batchs" (plusieurs détections en même temps).

    IMAGE (Sortie) : L'image finale fusionnée (Fond + Dessin). C'est ce que tu envoies au modèle Flux pour le "Img2Img".

    MASK (Sortie) : Un masque binaire (noir et blanc). Il indique à Flux précisément où tu as dessiné. Tout ce qui est dessiné sera modifié par l'IA, tout ce qui est vide restera intact.

3. Les commandes de l'interface

    🖌️ Pinceau : Pour dessiner manuellement.

    🫗 Pot de peinture : Remplit une zone fermée ou une zone de même couleur. Très utile pour colorier rapidement un masque SAM importé.

    🧽 Gomme : Pour effacer tes traits ou affiner un masque IA.

    🔄 Sync : Crucial. Il sert à importer l'image que tu as branchée en entrée sur le fond du canvas pour te servir de guide. Il faut d'abord faire un premier run pour que le node détecte l'image et ensuite cliquer sur sync pour importer.

    🤖 Auto : Importe le masque venant de l'entrée auto_mask (On peut utiliser SAM3 par exemple pour détecter des choses dans l'image et en faire des masks) . Il fusionne automatiquement tous les objets détectés et rend le fond transparent

    pour ne pas effacer les dessins précédents. Il faut d'abord faire un premier run pour que les masks soient chargés et ensuite en appuyant sur auto ça affiche les masques sur l'image qui aété chargée précédemment par sync. On peu changer

    la couleur des masks et on peut effacer des masks avec la gomme.

    🗑️ Poubelle : Efface tout ton dessin (mais garde le fond).

5. Workflow type : Édition assistée par IA

Voici comment utiliser le node au maximum de ses capacités :

    Préparation : Connecte une image à image. Connecte un détecteur (ex: GroundingDINO + SAM) à auto_mask.

    Premier passage : Clique sur Queue Prompt. Le serveur calcule l'image et détecte les objets.

    Mise en place : * Clique sur Sync : Ton image apparaît.

        Clique sur Auto : Les zones détectées (ex: tous les visages) se colorent instantanément sur ton canvas.

    Retouche : * Prends la Gomme pour enlever un visage que tu ne veux pas changer.

        Prends le Pinceau pour ajouter une zone à modifier à la main.

        Change la couleur avec le Pot de peinture si tu veux donner une indication de couleur différente à Flux.

    Génération : Relance Queue Prompt. Flux reçoit l'image fusionnée et le masque exact de tes traits.
