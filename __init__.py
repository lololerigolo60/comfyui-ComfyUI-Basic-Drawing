from .drawing_node import NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS

# On exporte ces dictionnaires pour que ComfyUI les détecte au démarrage
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']

# Optionnel : Indiquer où se trouve le dossier JS (normalement automatique si dans /web/js)
WEB_DIRECTORY = "./web"