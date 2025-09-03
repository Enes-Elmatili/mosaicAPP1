# 1. Importation des librairies nécessaires
# numpy est utilisé pour la manipulation des données (création de tableaux)
import numpy as np 
# LinearRegression est l'algorithme de scikit-learn que nous allons utiliser
from sklearn.linear_model import LinearRegression

# 2. Préparation des données d'entraînement
# Nous allons simuler des données de prix de maison en fonction de leur taille
# X (majuscule) est la variable indépendante (la taille en mètres carrés)
X = np.array([50, 70, 90, 110, 130, 150]).reshape(-1, 1) # .reshape(-1, 1) est nécessaire pour sklearn
# y (minuscule) est la variable dépendante (le prix)
y = np.array([200000, 250000, 300000, 350000, 400000, 450000])

# 3. Création et entraînement du modèle de régression linéaire
# On crée une instance du modèle
model = LinearRegression()
# On entraîne le modèle en utilisant nos données
model.fit(X, y)

# 4. Faire une prédiction
# On veut prédire le prix d'une maison de 100 mètres carrés
# La donnée doit aussi être dans le format attendu par le modèle
taille_a_predire = np.array([[100]])
prix_predit = model.predict(taille_a_predire)

# 5. Afficher les résultats
print("Le prix prédit pour une maison de 100 m² est :", prix_predit[0], "€")

# Vous pouvez aussi afficher les coefficients du modèle
# Intercept: le prix de base lorsque la taille est 0
print("Intercept (prix de base) :", model.intercept_)
# Coefficient: l'augmentation de prix par mètre carré
print("Coefficient (prix par m²) :", model.coef_[0])

# Le modèle a appris que le prix est égal à : Intercept + Coefficient * Taille
# En utilisant nos données, le modèle a trouvé que :
# Prix = 125000 + 2500 * Taille
# Testons avec notre prédiction pour une taille de 100m² :
# Prix = 125000 + 2500 * 100 = 125000 + 250000 = 375000
# C'est exactement ce que le modèle a prédit !
