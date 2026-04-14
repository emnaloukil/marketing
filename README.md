# EduKids - Development Guide

🧪 **Test de workflow - Cette ligne a été ajoutée sur une feature branch**

## 🚀 Démarrage Rapide

### Pour commencer à développer :
```bash
# Utilisez ce script pour mettre à jour en toute sécurité
./update.bat
```

## 📋 Workflow Git Recommandé

### 1. Créer une branche pour chaque fonctionnalité
```bash
git checkout -b feature/nom-de-la-fonctionnalite
```

### 2. Commiter régulièrement
```bash
git add .
git commit -m "Description claire de vos changements"
```

### 3. Pousser vos changements
```bash
git push origin feature/nom-de-la-fonctionnalite
```

### 4. Créer une Pull Request
- Allez sur GitHub
- Créez une PR vers `main`
- Attendez la review

## 🛠️ Commandes Utiles

### Mise à jour sécurisée
```bash
git stash push -m "sauvegarde"
git pull origin main
git stash pop
```

### Vérifier l'état
```bash
git status
git log --oneline -5
```

### Branches
```bash
git branch -a          # Voir toutes les branches
git checkout -b nom    # Créer et changer de branche
```

## 🔧 Dépannage

### "Mes pages ont disparu après un pull"
1. Vérifiez si vous avez des changements non sauvegardés : `git status`
2. Si oui, récupérez-les : `git stash pop`
3. Sinon, récupérez depuis un commit précédent : `git checkout HEAD~1 -- chemin/fichier`

### "Erreur de dépendances"
```bash
cd frontend && rm -rf node_modules && npm install
cd ../backend && rm -rf node_modules && npm install
```

## 📁 Structure du Projet

```
EduKids/
├── frontend/          # Application React
├── backend/           # API Node.js/Express
├── update.bat         # Script de mise à jour
└── README.md          # Ce fichier
```

## 🎯 Bonnes Pratiques

- ✅ Travaillez toujours sur des branches (pas sur `main`)
- ✅ Commitez souvent avec des messages clairs
- ✅ Testez avant de pousser
- ✅ Utilisez `./update.bat` pour mettre à jour
- ❌ Ne commitez jamais `node_modules/`

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez ce guide
2. Regardez `git status` et `git log`
3. Utilisez les commandes de dépannage ci-dessus