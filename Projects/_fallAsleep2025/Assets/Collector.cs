using UnityEngine;

public class Collector : MonoBehaviour
{
    public float xLoc, yLoc;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        xLoc = 0;
        yLoc = 0;

    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Z))
        {
            Debug.Log("Left");
            xLoc -= 0.1f;
        }
        if (Input.GetKeyDown(KeyCode.X))
        {
            Debug.Log("Right");
            xLoc += 0.1f;
        }

        this.transform.position = new Vector3(xLoc, yLoc, 0);

    }
}
