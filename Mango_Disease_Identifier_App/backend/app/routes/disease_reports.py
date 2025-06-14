from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.disease_report import DiseaseReport, Coordinates
from app.models.user import User
from datetime import datetime

disease_reports = Blueprint('disease_reports', __name__)

@disease_reports.route('/', methods=['POST'])
@jwt_required()
def create_report():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        user = User.objects.get(id=user_id)

        coordinates = Coordinates(
            latitude=data['coordinates']['latitude'],
            longitude=data['coordinates']['longitude']
        )

        report = DiseaseReport(
            disease_name=data['diseaseName'],
            severity=data['severity'],
            tree_age=data['treeAge'],
            location=data['location'],
            coordinates=coordinates,
            weather=data.get('weather', ''),
            notes=data.get('notes', ''),
            image_uri=data['imageUri'],
            symptoms=data.get('symptoms', []),
            recommendations=data.get('recommendations', []),
            user=user
        )

        report.save()
        return jsonify(report.to_dict()), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@disease_reports.route('/', methods=['GET'])
@jwt_required()
def get_reports():
    try:
        user_id = get_jwt_identity()
        reports = DiseaseReport.objects(user=user_id).order_by('-timestamp')
        return jsonify([report.to_dict() for report in reports])

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@disease_reports.route('/<report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    try:
        user_id = get_jwt_identity()
        report = DiseaseReport.objects.get(id=report_id, user=user_id)
        return jsonify(report.to_dict())

    except DiseaseReport.DoesNotExist:
        return jsonify({'error': 'Report not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@disease_reports.route('/sync', methods=['POST'])
@jwt_required()
def sync_reports():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        user = User.objects.get(id=user_id)
        results = []

        # Handle both array and object formats
        reports_data = data if isinstance(data, list) else data.get('reports', [])
        
        for report_data in reports_data:
            try:
                # Extract coordinates from the data
                coordinates = Coordinates(
                    latitude=report_data['coordinates']['latitude'],
                    longitude=report_data['coordinates']['longitude']
                )

                # Create the report
                report = DiseaseReport(
                    disease_name=report_data['diseaseName'],
                    severity=report_data['severity'],
                    tree_age=report_data['treeAge'],
                    location=report_data['location'],
                    coordinates=coordinates,
                    weather=report_data.get('weather', ''),
                    notes=report_data.get('notes', ''),
                    image_uri=report_data['imageUri'],
                    symptoms=report_data.get('symptoms', []),
                    recommendations=report_data.get('recommendations', []),
                    user=user,
                    synced=True,
                    timestamp=datetime.fromisoformat(report_data.get('timestamp', datetime.utcnow().isoformat()))
                )

                report.save()
                results.append({
                    'success': True, 
                    'report': report.to_dict(),
                    'original_id': report_data.get('id')
                })
            except Exception as e:
                results.append({
                    'success': False, 
                    'error': str(e),
                    'original_id': report_data.get('id')
                })

        return jsonify({
            'success': True,
            'results': results,
            'message': f'Processed {len(reports_data)} reports'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to sync reports'
        }), 500

@disease_reports.route('/stats/summary', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        user_id = get_jwt_identity()
        
        # Get total reports
        total_reports = DiseaseReport.objects(user=user_id).count()
        
        # Get disease distribution
        disease_distribution = DiseaseReport.objects(user=user_id).aggregate([
            {
                '$group': {
                    '_id': '$disease_name',
                    'count': {'$sum': 1},
                    'severity': {
                        '$push': {
                            'severity': '$severity',
                            'count': 1
                        }
                    }
                }
            },
            {'$sort': {'count': -1}}
        ])
        
        # Get location distribution
        location_distribution = DiseaseReport.objects(user=user_id).aggregate([
            {
                '$group': {
                    '_id': '$location',
                    'count': {'$sum': 1}
                }
            },
            {'$sort': {'count': -1}}
        ])

        return jsonify({
            'totalReports': total_reports,
            'diseaseDistribution': list(disease_distribution),
            'locationDistribution': list(location_distribution)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500 