window.onload = () => {
    let testEntitiesAdded = localStorage.getItem('entitiesAdded') || false;
    alert('If testing the lat/lon manual input on a mobile device, please turn off your GPS to avoid the real location being detected.');
    const el = document.querySelector("[gps-new-camera]");
    el.addEventListener("gps-camera-update-position", e => {
        if(!testEntitiesAdded) {6
            alert(`Got first GPS position: lon ${e.detail.position.longitude} lat ${e.detail.position.latitude}`);
            // Add four boxes to the north (red), south (yellow), west (blue)
            // and east (red) of the initial GPS position
            const properties = [{
                    color: 'red', // North
                    latDis: 0.00001,
                    lonDis: 0
                },{
                    color: 'yellow', // South
                    latDis: -0.00001,
                    lonDis: 0
                },{
                    color: 'blue', // West
                    latDis: 0,
                    lonDis: -0.00001
                },{
                    color: 'green', // East
                    latDis: 0,
                    lonDis: 0.00001
                }
            ];
            for(const prop of properties) {
                const entity = document.createElement("a-box");
                entity.setAttribute("scale", {
                    x: 2, 
                    y: 2,
                    z: 2
                });
                entity.setAttribute('material', { color: prop.color } );
                entity.setAttribute('rotation', {x: 0, y: 45, z: 45});
                entity.setAttribute('animation__position', "property: object3D.position.y; to: 2.2; dir: alternate; dur: 2000; loop: true");
                entity.setAttribute('animation__mouseenter', "property: scale; to: 2.3 2.3 2.3; dur: 300; startEvents: mouseenter");
                entity.setAttribute('animation__mouseleave', "property: scale; to: 2 2 2; dur: 300; startEvents: mouseleave")
                entity.setAttribute('gps-new-entity-place', {
                    latitude: e.detail.position.latitude + prop.latDis,
                    longitude: e.detail.position.longitude + prop.lonDis
                });
                
                document.querySelector("a-scene").appendChild(entity);
            }
            localStorage.setItem('entitiesAdded', true);
        }
    });
};