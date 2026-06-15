from django.test import TestCase
from rest_framework.test import APIClient
from .models import Species, Breed, Animal, AnimalContentFolder

class AnimalsAppTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.species = Species.objects.create(name="Caballos", description="Caballos del rancho")
        self.breed = Breed.objects.create(species=self.species, name="Pura Sangre")
        self.animal = Animal.objects.create(
            name="Rayo",
            species=self.species,
            breed=self.breed,
            description="Caballo veloz rescatado",
            sex="MALE",
            health_status="GOOD",
            is_available_for_sponsorship=True
        )
        self.folder = AnimalContentFolder.objects.create(
            animal=self.animal,
            name="Fotos del rescate",
            min_tier_level=0
        )

    def test_species_list_api(self):
        response = self.client.get("/api/species/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["name"], "Caballos")

    def test_animal_list_api(self):
        response = self.client.get("/api/animals/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
        self.assertEqual(response.data[0]["name"], "Rayo")

    def test_animal_detail_api(self):
        response = self.client.get(f"/api/animals/{self.animal.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Rayo")
        self.assertEqual(response.data["species_name"], "Caballos")

    def test_content_folders_filtering(self):
        response = self.client.get(f"/api/ranch-folders/?animal={self.animal.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Fotos del rescate")
