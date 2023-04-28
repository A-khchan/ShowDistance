//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Albert Chan on 4/15/23.
//

import SafariServices
import os.log
import MapKit


let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling, CLLocationManagerDelegate {

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)

        let income_msg = message as! [String: String]
        
        //Example
        //let address = "1600 Amphitheatre Parkway, Mountain View, CA"
        let address = income_msg["address"]!
        let from_latitude = income_msg["latitude"]! as String
        let from_longitude = income_msg["longitude"]! as String
        
        let curLocation: CLLocation = CLLocation.init(latitude: Double(from_latitude)!, longitude: Double(from_longitude)!)
        
        
        findCoordinates(for: address) { (coordinates, error) in
            if let error = error {
                //print("Error: \(error.localizedDescription)")
                let responseMsg = [
                    "distance": "Error when getting coordinates: " + error.localizedDescription,
                    "result": "error"
                ]
                
                let response = NSExtensionItem()
                response.userInfo = [ SFExtensionMessageKey: responseMsg ]
                
                context.completeRequest(returningItems: [response], completionHandler: nil)
            } else if let coordinates = coordinates {
                //print("Latitude: \(coordinates.latitude), Longitude: \(coordinates.longitude)")
                let cl_loc_distination: CLLocation = CLLocation.init(latitude: coordinates.latitude, longitude: coordinates.longitude)
                //distance in miles: function return meters, convert to miles
                let distance: Double = curLocation.distance(from: cl_loc_distination) / 1000.0 * 0.621371
                
                //Calc. bearing
                let coordA = curLocation.coordinate
                let coordB = cl_loc_distination.coordinate

                let lat1 = coordA.latitude.degreesToRadians
                let lon1 = coordA.longitude.degreesToRadians
                let lat2 = coordB.latitude.degreesToRadians
                let lon2 = coordB.longitude.degreesToRadians

                let dLon = lon2 - lon1

                let y = sin(dLon) * cos(lat2)
                let x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon)
                let bearing = atan2(y, x).radiansToDegrees
                let bearingString = String(format: "%.4f", bearing)
                
                //responseMsg will like [ "distance": "20.12 miles", ... ]
                let responseMsg = [
                    "distance": String(format: "%.2f", distance) + " miles",
                    "result": "success",
                    "bearing": bearingString
                ]
                
                let response = NSExtensionItem()
                response.userInfo = [ SFExtensionMessageKey: responseMsg ]
                
                context.completeRequest(returningItems: [response], completionHandler: nil)
            }
        }
        
    }

    func findCoordinates(for address: String, completion: @escaping (CLLocationCoordinate2D?, Error?) -> ())  {
        let geocoder = CLGeocoder()
        geocoder.geocodeAddressString(address) { (placemarks, error) in
            if let error = error {
                completion(nil, error)
                return
            }
            guard let placemark = placemarks?.first,
                  let location = placemark.location else {
                completion(nil, NSError(domain: "Address not found", code: 1, userInfo: nil))
                return
            }
            completion(location.coordinate, nil)
        }
    }
    
    
    
}




extension Double {
    var degreesToRadians: Double { return self * .pi / 180 }
}

extension Double {
    var radiansToDegrees: Double { return self * 180 / .pi }
}
