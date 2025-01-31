using UnityEngine;
using System.Collections;


public class BallScript : MonoBehaviour
{
    public float ballSpeed = 2;

    private int[] directions = { -1, 1 };
    private Rigidbody2D rb;

    private int hDir, vDir;


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        rb = gameObject.GetComponent<Rigidbody2D>();
        StartCoroutine(Launch());
    }

    // Update is called once per frame
    void Update()
    {

    }

    private IEnumerator Launch()
    {
        //wait for x seconds and choose random x direction
        hDir = Random.Range(0, directions.Length);
        //choose random x direction
        vDir = Random.Range(0, directions.Length);

        Random.ra

        //Cho0se random y direction

        yield return new WaitForSeconds(1);

    }

    void onCollisionEnter2D(Collision2D wall)
    {
        if (wall.gameObject.name == "leftWall")
        {
            //give points to player 2

            Reset();
        }
        if (wall.gameObject.name == "rightWall")
        {
            //give points to player 2
            Reset();

        }
    }

    void Reset()
    {
        this.transfortm.localPosition =
        //reset to 0/0

        StartCoroutine(Launch());

    }
}
