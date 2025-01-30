using UnityEngine;

public class PipeSpawnerScript : MonoBehaviour
{
    public GameObject pipe;
    public float spawnRate = 2f;
    private float timer = 0f;
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        if (timer < spawnRate)
        {
            timer += Time.deltaTime; // Fixed incorrect usage of deltaTime
        }
        else
        {
            Instantiate(pipe, transform.position, transform.rotation);
            timer = 0f; // Reset the timer after spawning
        }
    }
}
