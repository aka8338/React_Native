from datetime import datetime
from mongoengine import Document, StringField, FloatField, ListField, BooleanField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField

class Coordinates(EmbeddedDocument):
    latitude = FloatField(required=True)
    longitude = FloatField(required=True)

class DiseaseReport(Document):
    disease_name = StringField(required=True, max_length=100)
    severity = StringField(required=True, choices=['mild', 'moderate', 'severe'])
    tree_age = StringField(required=True, choices=['youngTree', 'matureTree', 'oldTree'])
    location = StringField(required=True, max_length=200)
    coordinates = EmbeddedDocumentField(Coordinates, required=True)
    weather = StringField(max_length=100)
    notes = StringField(max_length=500)
    image_uri = StringField(required=True)
    symptoms = ListField(StringField(max_length=200))
    recommendations = ListField(StringField(max_length=200))
    user = ReferenceField('User', required=True)
    synced = BooleanField(default=True)
    timestamp = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'disease_reports',
        'indexes': [
            ('user', '-timestamp'),
            'disease_name',
            {'fields': ['location'], 'type': 'text'}
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'disease_name': self.disease_name,
            'severity': self.severity,
            'tree_age': self.tree_age,
            'location': self.location,
            'coordinates': {
                'latitude': self.coordinates.latitude,
                'longitude': self.coordinates.longitude
            },
            'weather': self.weather,
            'notes': self.notes,
            'image_uri': self.image_uri,
            'symptoms': self.symptoms,
            'recommendations': self.recommendations,
            'user_id': str(self.user.id),
            'synced': self.synced,
            'timestamp': self.timestamp.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(DiseaseReport, self).save(*args, **kwargs) 