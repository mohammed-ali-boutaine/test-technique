 possède ses propres documents
 interroge le système depuis son propre espace utilisateur
 ne doit jamais accéder aux données de l’autre client


Chaque requête est associée à un client via un header HTTP (X-API-KEY).
Exemples :
 tenantA_key → client A
 tenantB_key → client B
Le client ne doit jamais être indiqué dans le body de la requête.
La séparation doit être gérée côté serveur.



Livrables attendus

1. Le code (repository Git ou archive)
2. Un README expliquant :
o comment lancer le backend
o comment lancer l’interface
o comment tester séparément le client A et le client B



réponse basée sur les documents de l’autre client
 réponse sans source
 invention d’information
 absence de gestion du cas “aucune réponse possible pour ce client”